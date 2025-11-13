import { twMerge } from "tailwind-merge";
import { RadioGroup } from "@headlessui/react";
import type { Question } from ".";

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {String}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

const AnswerRadioGroup = ({
  question,
  handleAnswer,
  selectedAnswer,
}: {
  question: Question;
  handleAnswer: (answer: string, question: string) => void;
  selectedAnswer: string;
}) => {
  const questionString = question.question;
  return (
    <RadioGroup
      value={selectedAnswer}
      onChange={(answer: string) => {
        handleAnswer(answer, question.question);
      }}
      className="flex flex-col gap-2"
    >
      {question.answers.map((answer, i) => (
        <RadioGroup.Option
          key={hashCode(`${questionString}-${answer}-${i}`)}
          value={answer}
          className={({ checked }) =>
            twMerge(
              "flex cursor-pointer items-center gap-4 rounded-lg border-2 border-gp-green-50 px-4 py-2 hover:border-gp-green-400 hover:bg-gp-green-50",
              checked ? "border-gp-green-400" : "border-gp-green-50",
            )
          }
        >
          {({ checked }) => (
            <>
              <div className="aspect-square w-5 rounded-full border-2 border-gp-green-600 bg-gp-green-100 p-[3px]">
                {checked && (
                  <div className="h-full w-full rounded-full bg-black"></div>
                )}
              </div>

              <p className="block text-left">{answer}</p>
            </>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};

export default AnswerRadioGroup;
