import { ICharity } from "@/models/Charity";

export interface CharityCard extends Pick<ICharity, 'name' | 'slug' | 'shortDescription' | 'coverImage' | 'category' | 'country' | 'featured' | 'totalRaised'> {
    _id: string
};