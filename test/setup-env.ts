// Los e2e no deben depender del .env local de cada quien.
process.env.JWT_SECRET ??= 'secreto-solo-para-tests';
