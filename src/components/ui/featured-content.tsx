'use client';
import { ArrowRight, Check } from 'lucide-react';

const FeaturedContent = () => {
  const imgSrc = "https://i.ibb.co/3YvL6sMH/Gemini-Generated-Image-k4njh5k4njh5k4nj.png";
  const fallbackSrc = "https://placehold.co/600x450/EEE/31343C?text=Image+Not+Found";

  return (
    <section 
      className="py-16 px-6 max-w-[1400px] mx-auto my-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      style={{ background: 'linear-gradient(135deg, #F9F9F9 0%, #FFFFFF 100%)' }}
    >
      {/* Left Column (Text Content) */}
      <div className="flex flex-col gap-4 items-start p-0">
        <span className="w-[60px] h-[4px] bg-[#FFD700] rounded-sm block mb-4"></span>
        <h2 className="text-[42px] font-extrabold text-[#001F3F] leading-tight -tracking-[0.5px] max-w-[600px] mb-3">
          With Traceability, We Show Our Work
        </h2>
        <h3 className="text-[18px] font-semibold text-[#003366] leading-snug max-w-[500px] mb-5">
          We believe in transparency. Our digital traceability system allows you to see the journey of every product, from the farm to your shelf.
        </h3>
        <p className="text-[16px] font-normal leading-relaxed text-[#555555] max-w-[550px] mb-6">
          Our commitment to quality goes beyond sourcing. We provide complete visibility into our supply chain, so you can be confident in the authenticity and safety of every item you purchase.
        </p>
        <ul className="flex flex-col gap-3 mb-6">
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FFD700] text-[#001F3F] flex items-center justify-center">
              <Check size={14} />
            </div>
            <span className="text-[15px] font-medium text-[#555555] leading-relaxed">End-to-end product tracking</span>
          </li>
          <li className="flex flex-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FFD700] text-[#001F3F] flex items-center justify-center">
              <Check size={14} />
            </div>
            <span className="text-[15px] font-medium text-[#555555] leading-relaxed">Verified sourcing from trusted partners</span>
          </li>
          <li className="flex flex-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FFD700] text-[#001F3F] flex items-center justify-center">
              <Check size={14} />
            </div>
            <span className="text-[15px] font-medium text-[#555555] leading-relaxed">Real-time quality assurance data</span>
          </li>
        </ul>
        <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#001F3F] text-white rounded-[24px] font-semibold text-[14px] tracking-[0.3px] cursor-pointer transition-all duration-300 hover:bg-[#003366] hover:shadow-[0_6px_20px_rgba(0,31,63,0.25)]">
          Explore Our Supply Chain
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Right Column (Visual Content) */}
      <div className="flex items-center justify-center relative min-h-[400px]">
        <div 
            className="absolute w-[120%] h-[120%] rounded-xl -z-10 top-[-10%] left-[-10%]"
            style={{ background: 'linear-gradient(135deg, #FFFACD 0%, #FFF9E6 100%)' }}
        ></div>
        <img
          src={imgSrc}
          alt="Traceability map showing product journey"
          className="rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] object-contain transition-transform duration-300 hover:scale-105 w-full h-auto max-w-[600px]"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackSrc; }}
        />
        <div className="absolute top-6 right-6 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-md text-xs font-bold uppercase">
          Live Tracking
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;