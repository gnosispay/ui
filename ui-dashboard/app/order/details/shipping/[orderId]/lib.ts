export function truncateName(name: string, maxLength: number = 24) {
  if (name.length < maxLength) {
    return name;
  }

  // Split the name into individual parts
  const names = name.split(" ");
  if (names.length < 2) {
    return name;
  }

  const left = names[0];
  let center = " ";
  const right = names[names.length - 1];

  const middleNames = names.slice(1, names.length - 1);

  for (let i = 0; i < middleNames.length; i++) {
    const middleName = middleNames[i];
    if (!middleName) {
      continue;
    }
    const abbreviation = middleName.charAt(0) + " ";
    if (`${left}${center}${abbreviation}${right}`.length < maxLength) {
      center = `${center}${abbreviation}`;
    }
  }

  return `${left}${center}${right}`;
}
