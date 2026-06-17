const StatusBadge = ({ status }) => {
  const styles = {
    draft:     'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    ordered:   'bg-blue-100 text-blue-700',
    pending:   'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium 
      capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;