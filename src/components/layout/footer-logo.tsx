import React from 'react';
import Image from 'next/image'; // Import Image from next/image

interface FooterLogoProps {
  className?: string;
}

const FooterLogo: React.FC<FooterLogoProps> = ({ className }) => {
  return (
    <Image
      src="https://i.ibb.co/HLGBZXY6/footerlogor1.png"
      alt="Footer Logo"
      width={150} // Explicitly set width
      height={75} // Explicitly set height
      className={className} // Apply className directly to Image
    />
  );
};

export default FooterLogo;