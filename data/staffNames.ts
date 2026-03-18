export const STAFF_FIRST_NAMES = [
  'Mia', 'Priya', 'Kemi', 'Sofia', 'Aisha', 'Jade', 'Lena',
  'Zara', 'Chloe', 'Nia', 'Amara', 'Yuki', 'Rosa', 'Leila',
  'Fatima', 'Camille', 'Sana', 'Bianca', 'Nadia', 'Tara',
];

export const STAFF_LAST_NAMES = [
  'Chen', 'Okafor', 'Rivera', 'Kim', 'Hassan', 'Patel', 'Ng',
  'Santos', 'Diallo', 'Tanaka', 'Silva', 'Mensah', 'Ali', 'Park',
  'Gomez', 'Adeyemi', 'Zhao', 'Petrov', 'Johansson', 'Osei',
];

export const CUSTOMER_NAMES = [
  'Maya', 'Aaliyah', 'Sophie', 'Keisha', 'Daniela', 'Yuki',
  'Grace', 'Amara', 'Isabel', 'Nora', 'Fatou', 'Elena',
  'Jasmine', 'Temi', 'Riya', 'Charlotte', 'Zoe', 'Simone',
  'Adaeze', 'Luna', 'Mei', 'Valentina', 'Abena', 'Iris',
  'Nadia', 'Camille', 'Taraji', 'Suki', 'Blessing', 'Vera',
];

export const randomStaffName = (): string => {
  const first = STAFF_FIRST_NAMES[Math.floor(Math.random() * STAFF_FIRST_NAMES.length)];
  const last = STAFF_LAST_NAMES[Math.floor(Math.random() * STAFF_LAST_NAMES.length)];
  return `${first} ${last[0]}.`;
};

export const randomCustomerName = (): string =>
  CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
