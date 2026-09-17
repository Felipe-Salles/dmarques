import { getCollection } from 'astro:content';

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) =>
  a.data.order - b.data.order;

export const getServices = async () => (await getCollection('services')).sort(byOrder);
export const getProcess = async () => (await getCollection('process')).sort(byOrder);
export const getDifferentiators = async () =>
  (await getCollection('differentiators')).sort(byOrder);
export const getFaq = async () => (await getCollection('faq')).sort(byOrder);
export const getCases = async () => getCollection('cases');
