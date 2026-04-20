const fs = require('fs');
const path = require('path');

describe('smoke: repositório', () => {
  const root = path.join(__dirname, '..');

  test('README.md existe', () => {
    expect(fs.existsSync(path.join(root, 'README.md'))).toBe(true);
  });

  test('LICENSE existe', () => {
    expect(fs.existsSync(path.join(root, 'LICENSE'))).toBe(true);
  });

  test('CONTRIBUTING.md existe', () => {
    expect(fs.existsSync(path.join(root, 'CONTRIBUTING.md'))).toBe(true);
  });

  test('package.json é um JSON válido', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('interview-challenges');
    expect(pkg.scripts.test).toBeDefined();
  });
});
