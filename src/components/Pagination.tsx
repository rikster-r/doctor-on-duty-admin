type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: Props) => {
  const getPages = () => {
    const pages: (number | 'dots')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push('dots');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push('dots');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex gap-2 items-center">
      {getPages().map((item, index) => {
        if (item === 'dots') {
          return (
            <span key={index} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        const isActive = item === currentPage;

        return (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-100 transition'
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};

export default Pagination;
