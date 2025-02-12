<!-- components/DynamicForm.vue -->
<script setup lang="ts">
import { UInput, UTextarea } from "#components";
import { z, ZodType } from "zod";

const props = defineProps<{
  schema: ZodType
  state?: ComputedRef<any>
}>()

console.log('props', props.schema);
const formState = props.state

const getComponent = (field) => {
  switch (field._def.typeName) {
    case 'ZodString':
      return field._def.meta?.multiline ? UTextarea : UInput;
    default:
      return UInput;
  }
};

const isRequired = (field) => {
  return !!field._def.meta?.required
}

</script>

<template>
  <UForm v-if="props.schema" :schema="props.schema" :state="formState" class="space-y-4">
    <div v-for="(field, name) in schema.shape" :key="name">
      <UFormGroup v-slot="{ error }" :label="field._def.meta?.label || name" :name="name"
        :description="field._def.description"
        :error="isRequired(field) && !formState[name] && field._def.meta.required" :required="isRequired(field)">
        <component :is="getComponent(field)" v-model="formState[name]" :placeholder="field._def.meta?.placeholder" />
      </UFormGroup>
    </div>
    <slot></slot>
  </UForm>
</template>