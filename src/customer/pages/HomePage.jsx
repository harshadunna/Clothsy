import MainCarousel from '../components/HomeCarousel/MainCarousel';
import HomeSectionCarousel from '../components/HomeSectionCarousel/HomeSectionCarousel';
import { mens_kurta } from '../../Data/Men/men_kurta';

const HomePage = () => {
    return (
        <div>
            <MainCarousel />


            <div className='space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10'>
                <HomeSectionCarousel data={mens_kurta.slice(0, 10)} sectionName="Men's Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(10, 20)} sectionName="Men's Printed Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(5, 15)} sectionName="Cotton Blend Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(15, 25)} sectionName="Pure Cotton Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(20, 30)} sectionName="Designer Kurta" />
            </div>
        </div>
    );
};

export default HomePage;