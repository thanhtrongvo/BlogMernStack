import { Newspaper } from "lucide-react";

const BreakPage = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300" />
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">
              Tất cả bài viết
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-300 via-slate-300 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default BreakPage;
