import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";


const Banner = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  return (
    <div className="relative bg-gradient-to-b from-white to-gray-100 py-32 shadow-md overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <h1 className="text-6xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-gray-700 mb-6">
        Go Dev Blog
      </h1>
      
      <div className="flex text-xl flex-col items-center text-gray-700 max-w-4xl mx-auto px-6">
        <p className="mt-2 leading-relaxed text-center">
          Blog chia sẻ về ứng dụng AI vào thực tiễn; tự động hóa quy trình với
          <span className="font-semibold text-blue-600"> Make.com </span>và<span className="font-semibold text-green-600"> N8N</span>.
        </p>
        <p className="mt-2 leading-relaxed text-center">
          Ngoài ra, blog cũng là cuốn sổ tay ghi chép những kiến thức, trải
          nghiệm, mẹo và thủ thuật
        </p>
        <p className="mt-2 leading-relaxed text-center">
          mà mình học được. Hi vọng những bài viết nhỏ của mình sẽ hữu ích dành
          cho các bạn.
        </p>
      </div>
      
      <div className="relative mt-10 max-w-4xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="relative w-full mx-auto"
        >
          <Input 
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 h-14 rounded-full border-2 border-gray-300 shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 pl-6 transition-all" 
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
          >
            <Search className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Banner;
