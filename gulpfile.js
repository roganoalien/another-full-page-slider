const   gulp                = require('gulp'),
        autoprefixer        = require('gulp-autoprefixer'),
        babel               = require('gulp-babel'),
        concat              = require('gulp-concat'),
        connect             = require('gulp-connect'),
        del                 = require('del'),
        makedir             = require('make-dir'),
        minify              = require('gulp-minify'),
        open                = require('gulp-open'),
        rename              = require('gulp-rename'),
        stylus              = require('gulp-stylus'),
        sourcemaps          = require('gulp-sourcemaps'),
        fs                  = require('fs');
/***************
 * CONFIG VARS *
 ***************/
const   _$dist      = './dist',
        _$dev       = './dev',
        _$src       = './src',
        _assets     = '/assets',
        _css        = '/css',
        _dest       = _$dev,
        _js         = '/js',
        _port       = 3000;
/************************************************************************************
 *                                CUSTOM FANCY LOGS                                 *
 * FUNCIÓN PARA AGREGAR CONSOLE.LOGS EN TERMINAL DE COLORES CON EL CÓDIGO DE TIEMPO *
 *               YELLOW, RED, BLUE, PURPLE, GREEN INDICA CADA COLORES               *
 *     PARA HACER UN CONSOLE.LOG CON COLOR BLANCO, DEJAR VACÍA LA 2DA VARIABLE      *
 ************************************************************************************/
const log = (_text, _color = 'default', _break = true, _empty = false) => {
	let date = new Date,
		_date = `[${ addZero(date.getHours()) }:${ addZero(date.getMinutes()) }:${ addZero(date.getSeconds()) }]`,
		_formated = `\n${ _date } ${ _text }\n`;
	if(!_break){
		_formated = `${ _date } ${ _text }`;
	}
	if(_empty){
		return console.log('\x1b[37m%s\x1b[0m', '\n');
	}
	switch(_color){
		case 'yellow':
			return console.log('\x1b[33m%s\x1b[0m', _formated);
		case 'red':
			return console.log('\x1b[31m%s\x1b[0m', _formated);
		case 'blue':
			return console.log('\x1b[34m%s\x1b[0m', _formated);
		case 'purple':
			return console.log('\x1b[35m%s\x1b[0m', _formated);
		case 'green':
			return console.log('\x1b[32m%s\x1b[0m', _formated);
		default:
			return console.log('\x1b[37m%s\x1b[0m', _formated);
	}
};
const addZero = (i) => {
	if(i < 10){
		i = "0" + i;
	}
	return i;
};
/**********************************************************************************************
 *                                            PROD                                            *
 * TAREA QUE MODIFICA LAS VARIABLES GLOBALES EN CASO DE QUE QUERAMOS COMPILAR PARA PRODUCCIÓN *
 **********************************************************************************************/
gulp.task('prod', (done)=>{
	_DEV = false;
	_dest = _$comp;
	done();
});

/*******************************************************************************
 *                                 GIT-DELETE                                  *
 * BORRAR GIT DEL PROYECTO FUENTE PARA QUE PUEDA SER USADO EN OTRO REPOSITORIO *
 *******************************************************************************/
gulp.task('git-delete', (done)=>{
	return del(['.git/**/*', '.git/']).then(paths => {
		if(paths.length == 0){
			log('Ya se eliminó la carpeta de Git', 'yellow');
		} else {
			log(`Se eliminó:\n${ paths.join('\n') }`, 'yellow');
		}
	});
});
/*******************************************************************
 *                             DELETE                              *
 *          BORRA LAS CARPETAS DE DESARROLLO Y COMPILADO.          *
 * PARA EVITAR QUE SE VAYAN O COMPILEN ARCHIVOS QUE NO DEBAN DE IR *
 *******************************************************************/
gulp.task('delete', (done)=>{
	return del([_$dev, _$comp, `${ _screenshot }*.png`, `!${ _screenshot }gradient.png`]).then(paths => {
		if(paths.length == 0){
			log('No se borró ninguna carpeta', 'yellow');
		} else {
			log(`Se eliminó:\n${ paths.join('\n') }`, 'yellow');
		}
	});
});
/**********************************************************
 *                       DELETE-DEV                       *
 * TAREA PARA ELIMINAR DEV DESPUÉS DE TOMAR EL SCREENSHOT *
 **********************************************************/
gulp.task('delete-dev', (done)=>{
	return del(_$dev).then(paths => {
		log('Se limpió DEV', 'yellow');
	});
});
/*************************************************************
 *                        DEV-CREATE                         *
 * CREA LAS CARPETAS NECESARIAS PARA TRABAJAR DE FORMA LOCAL *
 *************************************************************/
gulp.task('create', ()=>{
	return makedir(_dest).then(path => {
		log(`${ _dest } -- C R E A D O`, 'green');
	});
});
/*********************************************************************
 *                          COPY-ASSETS                          *
 * COPIA Y PEGA LOS ASSETS DE SOURCE A LA CARPETA TEMP DE DESARROLLO *
 *********************************************************************/
gulp.task('copy-assets', ()=>{
	return gulp.src(`${ _$src }${ _assets }/**/*`)
		.pipe(gulp.dest(`${ _dest }${ _assets }`))
		.pipe(connect.reload())
		.on('end', ()=>{
			log(`Assets copiados a ${ _dest }`, 'green');
		});
});
/************************************************************************
 *                              COPY-HTML                               *
 * COPIA LOS HTML QUE ESTÁN AL PRIMER NIVEL DE SRC Y LOS PASA AL PRIMER *
 *                            NIVEL DE TEMP                             *
 ************************************************************************/
gulp.task('copy-html', ()=>{
	return gulp.src(`${ _$src }/*.html`)
		.pipe(gulp.dest(`${ _dest }`))
		.pipe(connect.reload())
		.on('end', ()=>{
			log(`Html copiados a ${ _dest }`, 'green');
		});
});
/*****************************
 *          STYLUS           *
 * COMPILA Y METE AUTOPREFIX *
 *****************************/
gulp.task('sass', () => {
	return gulp.src(`${ _$src }/sass/main.scss`)
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: _DEV ? '' : 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
		.pipe(rename('style.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(`${ _dest }${ _css }`))
		.pipe(connect.reload())
		.on('end', ()=>{
			log('SaSS Compilado', 'purple');
		});
});
