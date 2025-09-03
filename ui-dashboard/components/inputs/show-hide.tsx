import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Input from "./input-base";

interface ShowHideInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ShowHideInput = forwardRef(function ShowHideInput(
  props: ShowHideInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const [show, setShow] = useState(false);

  const toggleShow = () => {
    setShow(!show);
  };

  const Icon = show ? Eye : EyeSlash;

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={twMerge("pr-8", props.className)}
        disabled={props.disabled}
        ref={ref}
      />
      <Icon
        className="absolute right-3 top-3 text-gray-400 h-4 w-4 cursor-pointer"
        onClick={toggleShow}
      />
    </div>
  );
});

export default ShowHideInput;
