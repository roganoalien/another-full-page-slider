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
        sourcemaps          = require('gulp-sourcemaps');
/***************
 * CONFIG VARS *
 ***************/
const   _$comp      = './dist',
        _$dev       = './dev',
        _$src       = './src',
        _assets     = '/assets',
        _css        = '/css',
        _dest       = _$dev,
        _DEV        = true,
        _html       = 'index.html',
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
	return del([_$dev, _$comp]).then(paths => {
		if(paths.length == 0){
			log('No se borró ninguna carpeta', 'yellow');
		} else {
			log(`Se eliminó:\n${ paths.join('\n') }`, 'yellow');
		}
	});
});
/************************************************
 *                    CREATE                    *
 * CREA LAS CARPETAS NECESARIAS PARA DEV O DIST *
 ************************************************/
gulp.task('create', ()=>{
	return makedir(_dest).then(path => {
		log(`${ _dest } -- C R E A D O`, 'green');
	});
});
/******************************************************************
 *                          COPY-ASSETS                           *
 * COPIA Y PEGA LOS ASSETS DE SOURCE A LA CARPETA CORRESPONDIENTE *
 ******************************************************************/
gulp.task('copy-assets', ()=>{
	return gulp.src(`${ _$src }${ _assets }/**/*`)
		.pipe(gulp.dest(`${ _dest }${ _assets }`))
		.pipe(connect.reload())
		.on('end', ()=>{
			log(`Assets copiados a ${ _dest }`, 'green');
		});
});
/**************************************
 *             COPY-HTML              *
 * COPIA EL HTML A LA CARPETA DESTINO *
 **************************************/
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
gulp.task('stylus', () => {
	return gulp.src(`${ _$src }/stylus/main.styl`)
		.pipe(sourcemaps.init())
		.pipe(stylus({
			compress: _DEV ? 'false' : 'true'
		})).on('error', function(error){
            log(error, 'red');
        })
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
		.pipe(rename('another-slider.css'))
		.pipe(sourcemaps.write())
		.pipe(connect.reload())
		.pipe(gulp.dest(`${ _dest }${ _css }`))
		.on('end', ()=>{
			log('Stylus Compilado', 'purple');
		});
});
/*************************************************
 *                      JS                       *
 * COMPILA, CONCATENA Y MINIFICA EL JS DE SRC/JS *
 *************************************************/
gulp.task('js', ()=>{
    // return gulp.src(`${_$src}/js/*/**.js`)
    //     .pipe(sourcemaps.init())
    //     .pipe(babel({
    //         presets: ['@babel/env']
    //     }))
    //     .pipe(concat('another-slider.js'))
    //     // .pipe(!_DEV ? minify({ext:{src:'-min.js', min:'.js'}}) : sourcemaps.write('.'))
	// 	.pipe(connect.reload())
	// 	.pipe(gulp.dest(`${ _dest }${ _js }`))
	// 	.on('end', ()=>{
	// 		log('Js Compilado', 'yellow');
    // 	});
    return gulp.src(`${ _$src }/js/*.js`)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('another-slider.js'))
        .pipe(connect.reload())
        .pipe(gulp.dest(`${ _dest }/js`))
        .on('end', ()=>{
            log('JS compilado', 'yellow');
        });
});
/*******************************************************************
 *                          DELETE-MIN-JS                          *
 * JS EN PROD CREA UN -MIN.JS NO MINIFICADO, ESTA TAREA LO ELIMINA *
 *******************************************************************/
gulp.task('js-min-delete', ()=>{
	// return del(`${ _$comp }/js/main-min.js`).then(paths => {
	// 	if(paths.length == 0){
	// 		log('No se borró el archivo', 'yellow');
	// 	} else {
	// 		log(`Se eliminó:\n${ paths.join('\n') }`, 'yellow');
	// 	}
    // });
    log('borrar', red);
});
/****************************************
 *             ALL WATCHERS             *
 * TODOS LAS TAREAS DE OBSERVAR CAMBIOS *
 * ASSETS | SASS | JS | HTML | VENDORS  *
 ****************************************/
gulp.task('watchers', (done)=>{

	log('Watchers Runing', 'yellow');

    gulp.watch(`${ _$src }${ _assets }/**/*`, gulp.series('copy-assets'));
	gulp.watch(`${ _$src }/stylus/**/*.styl`, gulp.series('stylus'));
	gulp.watch(`${ _$src }/js/*.js`, gulp.series('js'));
	gulp.watch(`${ _$src }/*.html`, gulp.series('copy-html'));

	done();

});
/*********************************************
 *                LIVERELOAD                 *
 * TAREA DE HACER EL LIVERELOAD DEL SERVIDOR *
 *            DE FORMA AUTOMÁTICA            *
 *********************************************/
gulp.task('server', (done)=>{
	connect.server({
		host: '127.0.0.1',
		root: _dest,
		port: _port,
		livereload: true
	});
	done();
});
/*************************************************************
 *                           OPEN                            *
 * ABRE UNA VENTANA DEL NAVEGADOR, CON LA DIRECCIÓN INDICADA *
 *************************************************************/
gulp.task('open', ()=>{
	return gulp.src(`${ _dest }/${ _html }`)
		.pipe(open({ uri: `http://localhost:${ _port }/${ _html }` }));
});
/************************************************
 *                     GIT                      *
 * TAREA QUE CORRE LA TAREA DE BORRAR LO DE GIT *
 ************************************************/
gulp.task('git', gulp.series('git-delete'));
/***********************************************
 *                  MINI-DEV                   *
 * TAREA PARA NO DUPLICAR MISMAS TAREAS DE DEV *
 ***********************************************/
gulp.task('build', gulp.series('delete', 'create', 'copy-assets', 'copy-html', 'stylus', 'js'));
/**********************************************
 *                    DEV                     *
 * CORRE TODAS LAS TAREAS NECESARIAS PARA DEV *
 **********************************************/
gulp.task('dev', gulp.series('build', gulp.parallel('watchers', 'server', 'open')));
/******************************************
 *                  PROD                  *
 * CORRE TODAS LAS TAREAS PARA PRODUCCIÓN *
 ******************************************/
gulp.task('prod', gulp.series('build', 'js-min-delete'));
