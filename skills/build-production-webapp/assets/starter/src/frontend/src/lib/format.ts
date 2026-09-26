const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
export const dateTime = (value: string | Date) => dateTimeFormatter.format(new Date(value));
