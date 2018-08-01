const path = require('path'); // Used because of the explained reason below about path.
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  /*Entry: Is where webpack will start the bundling. O sea es donde empezara a buscar
  las dependencias para hacer el bundle.
  Important: Podemos especificar varios entry point, pero realmente usaremos uno en este caso
  */
  entry: './src/js/index.js',
  /*
  Output: Le dice a webpack donde salvar nuestro bundle files.
    - path: El valor del path que se le coloca a esta propiedad debe ser absoluto. Por ende para
    entonces tener acceso al absolut path pues tenemos que utilizar un built-in node package llamado:
    path. Este lo llamamos incluyendolo en el top de nuestro archivo con require.
  */
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  devServer: {
    // Directorio donde webpack debe poner los bundle.
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      fileName: 'index.html',
      template: './src/index.html'
     }
    )
  ]
}
