import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getPartialBalance(type: 'income' | 'outcome'): number {
    if (this.transactions.length > 0) {
      const sum = this.transactions
        .map(transaction => {
          return transaction.type === type ? transaction.value : 0;
        })
        .reduce((total, value) => total + value);
      return sum;
    }
    return 0;
  }

  public getBalance(): Response {
    const income = this.getPartialBalance('income');
    const outcome = this.getPartialBalance('outcome');
    const total = income - outcome;

    const response = {
      transactions: this.transactions,
      balance: {
        income,
        outcome,
        total,
      },
    };

    return response;
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    const income = this.getPartialBalance('income') || 0;
    const outcome = this.getPartialBalance('outcome') || 0;
    const total = income - outcome;

    if (type === 'outcome' && total - value < 0) {
      throw Error('The outcome is greater than income');
    }

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
