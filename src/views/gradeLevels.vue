<template>
    <div class="container-fluid">
        <div class="d-flex gap-2 mb-4 border-bottom pb-3">
            <button 
                v-if="true"
                @click="navigateToGrades" 
                :class="['btn', isGradesActive ? 'btn-primary' : 'btn-outline-primary']"
            >
                Grades
            </button>
            <button 
                v-if="true"
                @click="navigateToClasses" 
                :class="['btn', isClassesActive ? 'btn-primary' : 'btn-outline-primary']"
            >
                Classes
            </button>
        </div>
        <div class="mt-3">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()


const isGradesActive = computed(() => route.name === 'Grades' || route.name === 'CreateGrade' || route.name === 'EditGrade')
const isClassesActive = computed(() => route.name === 'Classes' || route.name === 'CreateClass' || route.name === 'EditClass')
// Navigation functions
const navigateToGrades = () => {
    router.push({ name: 'Grades' })
}

const navigateToClasses
 = () => {
    router.push({ name: 'Classes' })
}
</script>

<style scoped>
.container-fluid{
    max-width: 1200px;
    margin: 0 auto;
}
.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
.btn-outline-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
</style>