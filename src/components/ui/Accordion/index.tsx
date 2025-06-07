"use client";

import React, { type FC, useState } from "react";

// Type definations
import type { AccordionProps } from './index.d';

// Utility files
import { MediaSans } from '@/utils/fonts';

// Icons
import { ArrowDown } from "lucide-react";

const Accordion: FC<AccordionProps> = ({
  title,
  content
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden border-b border-solid border-black">
      {/* Accordion Header */}
      <button
        type="button"
        className="w-full text-left py-5 md:py-7 flex justify-between items-start md:items-center gap-2 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${MediaSans.className} text-[32px] md:text-[40px] 2xl:text-[44px] leading-[100%] flex-1 tracking-[0.5px]`}>{title}</span>
        <div className={`mt-2 md:mt-0 w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-black flex justify-center items-center transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          <ArrowDown width={24} height={24} className="text-white w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />
        </div>
      </button>

      {/* Accordion Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[500px] opacity-100 py-3" : "max-h-0 opacity-0 py-0"}`}
      >
        <p className="text-[16px] md:text-[20px] leading-[140%]">
          {content?.split(/\r?\n/).map((line) =>
            line.trim() === "" ? (
              <br key={line} />
            ) : (
              <React.Fragment key={line}>
                {line}
                <br />
              </React.Fragment>
            )
          )}
        </p>
      </div>
    </div>
  );
};

export default Accordion;