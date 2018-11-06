export default class Another {
    constructor(_wrapper = '.another-wrapper', _slides = '.another-slide'){
        this.wrapper = document.querySelectorAll(_wrapper);
        this.slides = document.querySelectorAll(_slides);
    }
}