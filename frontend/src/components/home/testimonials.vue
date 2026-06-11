<template>
  <section
    class="home-page-section testimonials-section width--page-size margin--auto"
    id="testimonials"
  >
    <MainCube left="8%" top="12%" width="large" height="large" />
    <MainCube
      color="pink"
      left="12%"
      top="18%"
      width="medium"
      height="x-large"
    />
    <MainCube left="78%" top="8%" width="large" height="medium" />
    <MainCube
      color="pink"
      left="72%"
      top="14%"
      width="medium"
      height="large"
    />
    <MainCube left="45%" bottom="8%" width="xxxx-large" height="large" />
    <MainCube
      color="pink"
      left="55%"
      bottom="5%"
      width="large"
      height="medium"
    />

    <div class="testimonials-content text--center">
      <h2 class="title--x-large">מה אומרים עלינו</h2>
      <p class="testimonials-subtitle">לקוחות שכבר חגגו איתנו</p>

      <div class="testimonials-grid">
        <article
          v-for="item in testimonials"
          :key="item.name"
          class="testimonial-card"
        >
          <span class="testimonial-quote-mark" aria-hidden="true">"</span>
          <div class="testimonial-stars" aria-label="5 כוכבים">
            <span v-for="n in 5" :key="n" class="testimonial-star">★</span>
          </div>
          <p class="testimonial-text">{{ item.quote }}</p>
          <footer class="testimonial-footer">
            <div class="testimonial-meta">
              <span class="testimonial-name">{{ item.name }}</span>
              <span class="testimonial-event">{{ item.eventType }}</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import MainCube from "@/components/library/background/MainCube.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TestimonialsSection",

  components: {
    MainCube,
  },

  data() {
    return {
      testimonials: [
        {
          name: "בר ועידן",
          eventType: "חתונה",
          quote:
            "האורחים העלו תמונות בלי להוריד אפליקציה פשוט סרקו את ה QR בכרטיסיה המעוצבת שהכנו דרך האתר. והחברים עפו על זה והעלו דברים מצחיקים!",
        },
        {
          name: "לילך ואורן",
          eventType: "חתונה",
          quote:
            "האתר ממש נוח, 2 דקות וסיימתי להכין הכל, והאורחים העלו הרבה תמונות מצחיקות! וקיבלנו תמיכה ומענה לכל מה שרצינו, הרגשנו שהם איתנו.",
        },
        {
          name: "שחר ויובל",
          eventType: "חתונה",
          quote:
            "קודם כל הם עזרו לנו בכל מה שרצינו וגם בנו בשבילנו משהו קטן שביקשנו במיוחד! הרגשנו שאפשר לסמוך עליהם. והעלו הרבה תמונות שהיה פשוט כיף לראות אחרי האירוע",
        },
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(70vh - 99px) !important;
  position: relative;
  
  h2 {
    font-weight: 700;
  }
}

.testimonials-section {
  background: linear-gradient(
    180deg,
    #f6858912 0%,
    #ffffff 45%,
    #f6858908 100%
  );
  padding: 6% 0 8%;
  overflow: hidden;

  @media only screen and (max-width: 600px) {
    padding: 12% 0 15%;
    min-height: fit-content;
  }
}

.testimonials-content {
  position: relative;
  z-index: 2;
  width: min(950px, 90%);
  margin: auto;

  h2 {
    margin-bottom: 0.5rem;
  }
}

.testimonials-subtitle {
  margin: 0 0 2.5rem;
  font-size: 1.1rem;
  color: #555;
  letter-spacing: 0.3px;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  text-align: right;

  @media only screen and (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 420px;
    margin: auto;
  }
}

.testimonial-card {
  position: relative;
  background: #ffffff77;
  backdrop-filter: blur(20px);
  border-radius: 18px;
  box-shadow: 0 4px 14px #0003;
  padding: 1.5rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px #0004;
  }
}

.testimonial-quote-mark {
  position: absolute;
  top: 0.5rem;
  inset-inline-start: 1rem;
  font-size: 3.5rem;
  line-height: 1;
  font-weight: 700;
  color: var(--pink);
  opacity: 0.35;
  font-family: Georgia, serif;
  pointer-events: none;
}

.testimonial-stars {
  display: flex;
  gap: 2px;
  direction: ltr;
  justify-content: flex-end;
}

.testimonial-star {
  color: var(--pink);
  font-size: 1rem;
  line-height: 1;
}

.testimonial-text {
  margin: 0;
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #333;
  letter-spacing: 0.2px;
}

.testimonial-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f6858944;
}

.testimonial-avatar {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: #f68589cc;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.testimonial-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: right;
}

.testimonial-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #222;
}

.testimonial-event {
  font-size: 0.82rem;
  color: #666;
}
</style>
