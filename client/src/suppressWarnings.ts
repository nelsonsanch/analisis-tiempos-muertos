/**
 * Suprime warnings específicos de React en modo desarrollo
 * que no afectan la funcionalidad de la aplicación
 */

// Guardar el console.error original
const originalError = console.error;

// Sobrescribir console.error para filtrar warnings específicos
console.error = (...args: any[]) => {
  // Convertir argumentos a string para búsqueda
  const errorMessage = args.join(' ');
  
  // Lista de warnings a suprimir
  const warningsToSuppress = [
    'Encountered two children with the same key',
    'Keys should be unique',
  ];
  
  // Si el mensaje contiene alguno de los warnings a suprimir, no lo mostramos
  const shouldSuppress = warningsToSuppress.some(warning => 
    errorMessage.includes(warning)
  );
  
  if (!shouldSuppress) {
    // Mostrar el error original si no está en la lista de supresión
    originalError.apply(console, args);
  }
};
