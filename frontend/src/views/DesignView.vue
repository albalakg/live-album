<template>
  <div class="design padding--large">
    <h1>
      עיצוב המערכת
    </h1>

    <br>

    <section>
      <h2>כפתורים</h2>
      <div class="padding--large width--sixth">
        <MainButton text="הזמן עכשיו" />
        <br>
        <MainButton color="pink" text="הזמן עכשיו" />
      </div>
    </section>

    <br>

    <section>
      <h2>שדות</h2>
      <div class="padding--large width--sixth">
        <MainInput title="שם פרטי" />
        <br>
        <MainInput icon="attach_file" type="file" title="תמונה" :allowedAssets="['image']" />
        <br>
        <MainInput readonly title="כתובת מייל" />
      </div>
    </section>

    <br>

    <section>
      <h2>קוביות רקע</h2>
      <div class="padding--large width--sixth">
        <MainCube />
        <br>
        <MainCube width="x-large" color="pink" />
        <br>
        <MainCube height="x-large" />
      </div>
    </section>

    <br>

    <section>
      <h2>קווים</h2>
      <div class="lines-wrapper padding--large width--sixth display--flex">
        <MainLine />
        <MainLine width="x-large" color="pink" />
        <MainLine width="small" />
        <MainLine width="x-small" color="pink" />
        <MainLine width="small" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DesignView',
  
  components: {
    MainButton,
    MainInput,
    MainCube,
    MainLine,
  },

  data() {
    return {
    };
  },

  computed: {
   
  },

  methods: {
 
  }
});
</script>

<style lang="scss" scoped>

.design {
  .lines-wrapper {
    height: 100px;
  }
}

</style>
