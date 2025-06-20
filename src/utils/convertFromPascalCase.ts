export const fromPascalCase = (str?: string) => {
  return (str || "").replace(/[A-Z]/g, (match, offset) => {
    return offset <= 0 ? match : ` ${match.toLowerCase()}`;
  });
};
