import clsx from "clsx";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

const Blockie: React.FC<Props> = ({ src, alt, className }) => {
  return (
    <div className={clsx("overflow-hidden rounded-[50%]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block h-full" />
    </div>
  );
};

export default Blockie;
