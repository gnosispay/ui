export const poll = async ({
  fn,
  validate,
  interval,
  maxAttempts,
}: {
  fn: () => any;
  validate: (result: any) => boolean;
  interval: number;
  maxAttempts?: number;
}) => {
  let attempts = 0;

  const executePoll = async (
    resolve: (result: any) => any,
    reject: (error: Error) => any,
  ) => {
    try {
      const result = await fn();
      attempts++;

      if (validate(result)) {
        return resolve(result);
      } else if (maxAttempts && attempts === maxAttempts) {
        return reject(new Error("Exceeded max attempts"));
      } else {
        setTimeout(executePoll, interval, resolve, reject);
      }
    } catch (e: any) {
      return reject(e as Error);
    }
  };

  return new Promise(executePoll);
};
