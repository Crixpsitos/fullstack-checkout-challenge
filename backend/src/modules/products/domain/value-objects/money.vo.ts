export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'COP',
  ) {
    if (amount < 0) throw new Error('El precio no puede ser negativo');
  }

  toString(): string {
    return `${this.currency} ${this.amount}`;
  }
}
