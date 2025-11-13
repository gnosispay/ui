// component forked from: https://github.com/driaug/country-picker

import { WAITLIST_COUNTRIES } from "@gnosispay/countries";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CountryFlag from "./country-flag";
import type { MutableRefObject } from "react";
export type CountryOption = (typeof WAITLIST_COUNTRIES)[number];

export interface CountryPickerProps {
  id: string;
  disabled?: boolean;
  onChange: (event: { target: { value: CountryOption } }) => void;
  value?: CountryOption;
}

export function CountryPicker({
  id,
  disabled = false,
  onChange,
  value,
}: CountryPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const onToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  useEffect(() => {
    const mutableRef = ref as MutableRefObject<HTMLDivElement | null>;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mutableRef.current &&
        !mutableRef.current.contains(event.target as Node) &&
        open
      ) {
        onToggle();
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggle, open, ref]);

  const handleChange = (value: CountryOption) => {
    onChange({ target: { value } });
  };

  const [query, setQuery] = useState("");

  return (
    <div ref={ref}>
      <div className="mt-1 relative">
        <button
          type="button"
          className={`${
            disabled ? "bg-neutral-100" : "bg-white"
          } relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none sm:text-sm`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="listbox-label"
          onClick={onToggle}
          disabled={disabled}
        >
          <span className="truncate flex items-center">
            {value && (
              <span className="mr-2">
                <CountryFlag countryNumericCode={value.numeric} />
              </span>
            )}
            {value?.name ?? "Select a country"}
          </span>
          <span
            className={`absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none ${
              disabled ? "hidden" : ""
            }`}
          >
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {open && (
          <ul
            className="absolute -top-1 z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
            aria-labelledby="listbox-label"
            aria-activedescendant="listbox-option-3"
          >
            <div className="sticky top-0 z-10 bg-white">
              <li className=" text-gray-900 cursor-default select-none relative p-3">
                <input
                  type="search"
                  name="search"
                  autoComplete={"off"}
                  autoFocus
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={"Search..."}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </li>
            </div>

            <div className={"max-h-64 overflow-y-scroll"}>
              {WAITLIST_COUNTRIES.filter((country) =>
                country.name.toLowerCase().startsWith(query.toLowerCase()),
              ).length === 0 ? (
                <li className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9">
                  No countries found
                </li>
              ) : (
                WAITLIST_COUNTRIES.filter((country) =>
                  country.name.toLowerCase().startsWith(query.toLowerCase()),
                ).map((option, index) => {
                  return (
                    <li
                      key={`${id}-${index}`}
                      className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 flex items-center hover:bg-gp-bg-subtle transition"
                      id="listbox-option-0"
                      role="option"
                      aria-selected={option.alpha2 === value?.alpha2}
                      onClick={() => {
                        handleChange(option);
                        setQuery("");
                        onToggle();
                      }}
                    >
                      <span className="mr-2">
                        <CountryFlag countryNumericCode={option.numeric} />
                      </span>

                      <span className="font-normal truncate">
                        {option.name}
                      </span>
                      {option.alpha2 === value?.alpha2 ? (
                        <span className="text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4">
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </li>
                  );
                })
              )}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
}
