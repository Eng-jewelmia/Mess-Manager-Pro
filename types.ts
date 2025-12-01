export type UserRole = 'admin' | 'manager' | 'viewer';

export interface Member {
  id: string;
  name: string;
  phone: string;
  meal: number;
  deposit: number;
  isManager: boolean;
  photo: string;
}

export interface FixedCosts {
  rent: number;
  maid: number;
  gas: number;
  wifi: number;
  masala: number;
  utility: number;
  totalMealCost: number;
}

export interface CalculatedMember extends Member {
  mealCost: number;
  fixedCostShare: number;
  totalCost: number;
  balance: number; // Positive = Receivable (Pabe), Negative = Payable (Dibe)
}

export interface CalculationResult {
  members: CalculatedMember[];
  stats: {
    totalMeals: number;
    totalMealCost: number;
    totalFixedCost: number;
    grandTotalCost: number;
    totalDeposit: number;
    mealRate: number;
    fixedPerMember: number;
    managerName: string;
  };
  generatedAt: string;
}