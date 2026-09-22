export abstract class ContentItem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly author: string,
    public readonly price: string
  ) {}

  abstract preview(): string;
}