import { Member, FixedCosts } from './types';

export const DEFAULT_FIXED_COSTS: FixedCosts = {
  rent: 21812,
  maid: 5000,
  gas: 1200,
  wifi: 600,
  masala: 500,
  utility: 250,
  totalMealCost: 24078,
};

export const DEFAULT_MEMBERS: Member[] = [
  { id: '1', name: "হিমেল", phone: "01711111111", meal: 51, deposit: 4030, isManager: false, photo: "" },
  { id: '2', name: "ফিরোজ", phone: "01722222222", meal: 35, deposit: 0, isManager: false, photo: "" },
  { id: '3', name: "তানভীর", phone: "", meal: 62.5, deposit: 1700, isManager: false, photo: "" },
  { id: '4', name: "কাওসার", phone: "", meal: 56.5, deposit: 2000, isManager: false, photo: "" },
  { id: '5', name: "ওবায়দুল", phone: "", meal: 45, deposit: 2000, isManager: false, photo: "" },
  { id: '6', name: "মিজান", phone: "", meal: 35, deposit: 1600, isManager: false, photo: "" },
  { id: '7', name: "জুয়েল", phone: "", meal: 35, deposit: 1000, isManager: false, photo: "" },
  { id: '8', name: "শাওন", phone: "", meal: 72.5, deposit: 2120, isManager: false, photo: "" },
  { id: '9', name: "আরিফ", phone: "", meal: 48, deposit: 1560, isManager: false, photo: "" },
  { id: '10', name: "রাব্বি", phone: "", meal: 42, deposit: 1800, isManager: false, photo: "" },
  { id: '11', name: "আপন", phone: "", meal: 40.5, deposit: 1898, isManager: false, photo: "" },
  { id: '12', name: "রিয়াদ", phone: "01700000000", meal: 80, deposit: 2420, isManager: true, photo: "" },
  { id: '13', name: "আজাহার", phone: "", meal: 74, deposit: 2000, isManager: false, photo: "" }
];

export const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
export const DEFAULT_ADMIN_PHOTO = "https://i.postimg.cc/Hncwxf9n/unnamed-1-1-removebg-300x300.jpg";

export const VALID_PINS = [
  "4831", "9075", "1268", "5402", "7819", 
  "3347", "6590", "2184", "9053", "4478", 
  "1629", "7034", "8921", "5708", "2147", 
  "3685", "9406", "8512", "4790", "6023"
];

export const ADMIN_PASSWORD = "Jewel0099";