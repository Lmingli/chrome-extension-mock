import { ref } from 'vue';

export default () => {
  const count = ref(1);
  const handleAdd = () => {
    setTimeout(() => {
      count.value ++;
    }, 1000)
  }

  return {
    count,
    handleAdd,
  };
}