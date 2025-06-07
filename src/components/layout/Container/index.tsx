import type { FC, ReactNode } from 'react'

// Type definitions
interface ContainerProps {
    className?: string;
    children: ReactNode;
}

const Container: FC<ContainerProps> = ({
    className = "",
    children
}) => {
  return (
    <div className={`max-w-[1440px] w-[90%] mx-auto ${className}`}>{children}</div>
  )
}

export default Container;