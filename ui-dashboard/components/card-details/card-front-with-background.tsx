import { twMerge } from "tailwind-merge";
import CardFront from "./card-front";

const CardFrontWithSVG = ({ className }: { className?: string }) => {
  return (
    <div
      className={twMerge(
        "flex-grow relative flex-col flex items-center gap-8 pt-10",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="436"
        height="459"
        viewBox="0 0 436 459"
        fill="none"
        className="absolute top-0 right-0 h-full w-full z-0"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M380.644 18.8873C430.079 52.9373 435.105 123.11 435.546 183.07C435.887 229.511 404.397 265.133 382.754 306.202C358.309 352.591 349.613 410.844 302.919 434.748C247.127 463.309 178.281 467.416 121.993 439.69C61.3555 409.821 11.4442 353.102 1.54168 286.297C-7.84672 222.959 34.9198 167.08 74.0833 116.474C107.996 72.6534 151.722 40.7853 204.556 23.9669C262.699 5.45815 330.349 -15.7553 380.644 18.8873Z"
          fill="#EEF6D6"
        />
      </svg>
      <div
        className={twMerge(
          "aspect-[160/253] h-[450px] m-auto z-10 relative transition-all duration-1000 [transform-style:preserve-3d] ease-in-out",
          "[transform:rotateY(0deg)]",
        )}
      >
        <CardFront className="absolute top-0 left-0 w-full h-auto rounded-xl shadow-gp-card [transform:rotateY(0deg)] [backface-visibility:hidden]" />
      </div>
    </div>
  );
};

export default CardFrontWithSVG;
