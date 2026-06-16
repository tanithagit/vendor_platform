import stripe
import os

# Read .env manually
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
env_path = os.path.join(BASE_DIR, ".env")

env_vars = {}
with open(env_path, "r", encoding="utf-8-sig") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

stripe.api_key = env_vars.get("STRIPE_SECRET_KEY")


def create_payment_intent(amount: float, currency: str = "inr") -> dict:
    """
    Create a Stripe payment intent.
    Amount is in rupees — Stripe needs paise (multiply by 100)
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to paise
            currency=currency,
            payment_method_types=["card"],
            metadata={"integration_check": "accept_a_payment"}
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": amount,
            "currency": currency,
            "status": intent.status
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def confirm_payment(payment_intent_id: str) -> dict:
    """Retrieve payment intent status from Stripe"""
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            "payment_intent_id": intent.id,
            "status": intent.status,
            "amount": intent.amount / 100  # Convert back from paise
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def create_payment_link(amount: float, description: str) -> dict:
    """
    Create a Stripe payment link for invoice payment.
    Easy way to accept payments without frontend integration.
    """
    try:
        # Create a price object
        price = stripe.Price.create(
            unit_amount=int(amount * 100),
            currency="inr",
            product_data={"name": description}
        )

        # Create payment link
        payment_link = stripe.PaymentLink.create(
            line_items=[{"price": price.id, "quantity": 1}]
        )

        return {
            "payment_link": payment_link.url,
            "payment_link_id": payment_link.id,
            "amount": amount
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")