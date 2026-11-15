export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      return await nextResolve(specifier, context);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        return await nextResolve(specifier + '.ts', context);
      }
      if (err.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
        return await nextResolve(specifier + '/index.ts', context);
      }
      throw err;
    }
  }
  return nextResolve(specifier, context);
}
