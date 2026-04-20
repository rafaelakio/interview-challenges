function sum(a, b) {
  return a + b;
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function isPalindrome(str) {
  const normalized = str.toLowerCase().replace(/\s+/g, '');
  return normalized === normalized.split('').reverse().join('');
}

module.exports = { sum, reverseString, isPalindrome };
