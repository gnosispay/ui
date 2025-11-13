import { Listbox } from "@headlessui/react";
import { hashCode } from "./answer-radio-group";
import type { Question } from ".";

const AnswerDropdown = ({
  question,
  handleAnswer,
  selectedAnswer,
}: {
  question: Question;
  handleAnswer: (answer: string, question: string) => void;
  selectedAnswer: string;
}) => {
  return (
    <Listbox
      as="div"
      value={selectedAnswer}
      onChange={(answer: string) => handleAnswer(answer, question.question)}
      className="relative w-full"
    >
      <Listbox.Button className="flex w-full items-center justify-between rounded-lg border-2 border-stone-300 px-4 py-2 pr-2 placeholder-black-400 focus:border-stone-600 focus:ring-0">
        <span className="block truncate text-left text-gp-moss">
          {selectedAnswer || "Select an answer"}
        </span>

        {/* <ChevronsUpDown className="h-5 w-5 text-gp-moss" aria-hidden="true" /> */}
      </Listbox.Button>
      <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gp-dust py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {question.answers.map((answer, i) => (
          <Listbox.Option
            key={hashCode(`${answer}-${i}`)}
            value={answer}
            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gp-moss ui-active:bg-gp-moss ui-active:bg-opacity-80 ui-active:text-gp-dust"
          >
            {answer}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
};

export default AnswerDropdown;
