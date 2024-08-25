export class PolicyNumberGenerator {
  private currentNumber: number;
  private prefix: string;

  constructor(prefix: string, startNumber: number) {
    this.prefix = prefix;
    this.currentNumber = startNumber;
  }

  public generatePolicyNumber(): string {
    const policyNumber = `${this.prefix}-${this.currentNumber
      .toString()
      .padStart(6, "0")}`;
    return policyNumber;
  }
}
