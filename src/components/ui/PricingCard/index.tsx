import { type FC } from "react";

// Type definitions
import type { PricingCardProps } from "./index.d";
import { MediaSans } from "@/utils/fonts";

// Icons
import { Check } from "@/utils/icons";

const PricingCard: FC<PricingCardProps> = ({ title, description, price, hourlyRate, includes }) => {
  const textClassNames = "text-[16px] md:text-[20px] text-white leading-[140%]";
  const priceTextClass = `${MediaSans.className} text-[52px] md:text-[72px] 2xl:text-[96px] tracking-[2px] text-white leading-[100%] flex items-center`;
  const dollarSign = <span className="text-[46px] md:text-[62px] 2xl:text-[82px] leading-[100%] mt-auto">$</span>;

  return (
    <div className="p-8 md:p-16 bg-black flex flex-col gap-4 md:gap-6 rounded-[30px] md:rounded-[52px]">
      {/* Title */}
      <h3 className={`${MediaSans.className} max-w-[500px] text-[42px] md:text-[58px] xl:text-[64px] 2xl:text-[72px] leading-[100%] text-white tracking-[4px]`}>
        {title}
      </h3>

      {/* Price */}
      {price && (
        <h2 className={priceTextClass}>
          {dollarSign}
          {price}
        </h2>
      )}

      {/* Hourly Rate */}
      {hourlyRate && (
        <div className="flex flex-row items-end gap-2 2xl:gap-6">
          <div className="flex items-end gap-2 2xl:gap-6">
            <h2 className={priceTextClass}>
              {dollarSign}
              {hourlyRate.min}
            </h2>
            <h2 className={priceTextClass}>-</h2>
            <h2 className={priceTextClass}>
              {dollarSign}
              {hourlyRate.max}
            </h2>
          </div>
          <p className="text-[20px] md:text-[28px] 2xl:text-[36px] text-white">per hour</p>
        </div>
      )}

      {/* Description & Includes */}
      <div className="flex flex-col gap-4">
        <p className={textClassNames}>{description}</p>
        <p className={textClassNames}>👉 Includes</p>
        <div className="flex flex-col gap-2">
          {includes.map((item) => (
            <div key={item} className="flex items-start md:items-center gap-2">
              <Check width={24} height={24} className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] text-white" />
              <p className={textClassNames}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
