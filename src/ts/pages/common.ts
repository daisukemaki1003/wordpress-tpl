import scrollAnimations from '../components/scroll_animation';

export default () => {
  new scrollAnimations().add(document.querySelectorAll('[data-anim-elm]'));
}