import make from "../../assets/make.png";
import chatgpt from "../../assets/chatgpt.png";
import n8n from "../../assets/n8n-logo.png";

const Section = () => {
  return (
    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-300 justify-center py-14 px-4 max-w-7xl mx-auto bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-sm">
      <div className="flex flex-col space-y-4 md:w-1/3 p-8 md:p-10 items-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <img
            src={make}
            className="w-14 h-14 object-contain"
            alt="Make.com logo"
          />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
          TỰ ĐỘNG HÓA VỚI MAKE.COM
        </h1>
        <p className="text-center text-gray-600 leading-relaxed">
          Học cách sử dụng Make.com từ cơ bản. Ứng dụng Make vào tự động hóa
          các quy trình thực tiễn giúp tiết kiệm thời gian và tăng hiệu suất
          công việc
        </p>
      </div>
      <div className="flex flex-col space-y-4 md:w-1/3 p-8 md:p-10 items-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg">
        <div className="bg-green-50 p-4 rounded-full mb-4">
          <img
            src={chatgpt}
            className="w-14 h-14 object-contain"
            alt="ChatGPT logo"
          />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
          LÀM BẠN VỚI AI
        </h1>
        <p className="text-center text-gray-600 leading-relaxed">
          Học các sử dụng các công cụ AI phổ biến và ứng dụng vào các công
          việc thực tiễn như xây dựng nội dung, sản xuất video, nghiên cứu
          tài liệu,…
        </p>
      </div>
      <div className="flex flex-col space-y-4 md:w-1/3 p-8 md:p-10 items-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg">
        <div className="bg-purple-50 p-4 rounded-full mb-4">
          <img
            src={n8n}
            className="w-14 h-14 object-contain"
            alt="N8N logo"
          />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
          TỰ ĐỘNG HÓA VỚI N8N
        </h1>
        <p className="text-center text-gray-600 leading-relaxed">
          Học cách sử dụng N8N từ cơ bản. Ứng dụng n8n vào tự động hóa các
          quy trình thực tiễn giúp tiết kiệm thời gian và tăng hiệu suất
          công việc.
        </p>
      </div>
    </div>
  );
};
export default Section;
