export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      return await nextResolve(specifier, context);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        return await nextResolve(specifier + '.ts', context);
      }
      throw err;
    }
  }
  return nextResolve(specifier, context);
}
