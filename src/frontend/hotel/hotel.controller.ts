import { Controller, Get } from '@nestjs/common';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';

@Layout('main')
@Controller('hotel')
export class HotelController {
  @Get()
  @Render(Page.HOTEL)
  getHotel() {}

  @Get(Page.WELCOME_TO_HABBO_HOTEL)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}`)
  getWelcomeToHabboHotel() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.HOW_TO_GET_STARTED}`)
  @Render(
    `${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.HOW_TO_GET_STARTED}`,
  )
  getHowToGetStarted() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.NAVIGATOR}`)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.NAVIGATOR}`)
  getNavigator() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.MEETING}`)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.MEETING}`)
  getMeeting() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.ROOM}`)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.ROOM}`)
  getRoom() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.HELP_SAFETY}`)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.HELP_SAFETY}`)
  getHelpSafety() {}

  @Get(`${Page.WELCOME_TO_HABBO_HOTEL}/${Page.CHATTING}`)
  @Render(`${Page.HOTEL}/${Page.WELCOME_TO_HABBO_HOTEL}/${Page.CHATTING}`)
  getChatting() {}

  @Get(`${Page.FURNITURE}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}`)
  getFurniture() {}

  @Get(`${Page.FURNITURE}/${Page.CATALOGUE}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.CATALOGUE}`)
  getCatalogue() {}

  @Get(`${Page.FURNITURE}/${Page.CATALOGUE1}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.CATALOGUE1}`)
  getCatalogue1() {}

  @Get(`${Page.FURNITURE}/${Page.CATALOGUE2}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.CATALOGUE2}`)
  getCatalogue2() {}

  @Get(`${Page.FURNITURE}/${Page.CATALOGUE4}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.CATALOGUE4}`)
  getCatalogue4() {}

  @Get(`${Page.FURNITURE}/${Page.DECORATION_EXAMPLES}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.DECORATION_EXAMPLES}`)
  getDecorationExamples() {}

  @Get(`${Page.FURNITURE}/${Page.STAFF_FAVOURITE}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.STAFF_FAVOURITE}`)
  getStaffFavourite() {}

  @Get(`${Page.FURNITURE}/${Page.TRADING}`)
  @Render(`${Page.HOTEL}/${Page.FURNITURE}/${Page.TRADING}`)
  getTrading() {}

  @Get(`${Page.PETS}`)
  @Render(`${Page.HOTEL}/${Page.PETS}`)
  getPets() {}

  @Get(`${Page.PETS}/${Page.TAKING_CARE_OF_YOUR_PET}`)
  @Render(`${Page.HOTEL}/${Page.PETS}/${Page.TAKING_CARE_OF_YOUR_PET}`)
  getTakingCareOfYourPet() {}
}
