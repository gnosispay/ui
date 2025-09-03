export const classNames = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const shortenName = (name: string): string => {
  return name.length < 20 ? name : `${name.substring(0, 17)}...`;
};

export const shortenAddress = (
  address: `0x${string}`,
  visibleStart?: number,
  visibleEnd?: number,
): string => {
  const startCount = visibleStart || 4;
  const endCount = visibleEnd || 4;
  const start = address.substring(0, startCount + 2);
  const end = address.substring(42 - endCount, 42);
  return `${start}...${end}`;
};
