export const getStatusName = (statusCode: number, statusName: string) => {
  switch (statusCode) {
    case 1000:
      return undefined;
    case 1005:
      return "Frozen";
    default:
      return statusName;
  }
};
