export interface IHashService {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashedText: string): Promise<boolean>;
  generateSecureToken(length?: number): string;
}
