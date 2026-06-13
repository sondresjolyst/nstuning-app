import SectionRenderer from '@/components/SectionRenderer';
import StructuredData from '@/components/StructuredData';
import { Section } from '@/types/content';
import { DEFAULT_SECTIONS } from '@/lib/defaultSections';
import { publicGet } from '@/lib/publicApi';

export const revalidate = 60;

export default async function Home() {
    const data = await publicGet<Section[]>('/content/home');
    const sections = data && data.length > 0 ? data : DEFAULT_SECTIONS;

    return (
        <div>
            <StructuredData />
            {sections.map(section => <SectionRenderer key={section.id} section={section} />)}
        </div>
    );
}
