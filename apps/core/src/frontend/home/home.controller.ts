import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UsersService } from 'src/api/users/users.service';
import { TextsService } from 'src/api/settings/texts.service';
import { Layout } from 'src/common/decorators/layout.decorator';
import { Render } from 'src/common/decorators/render.decorator';
import { Page } from 'src/common/enums/page.enum';
import { RoomsService } from 'src/api/rooms/rooms.service';
import { MessengerFriendsService } from 'src/api/messenger-friends/messenger-friends.service';
import { In } from 'typeorm';

@Layout('main')
@Controller('home')
export class HomeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly textsService: TextsService,
    private readonly roomsService: RoomsService,
    private readonly messengerFriendsService: MessengerFriendsService,
  ) {}

  @Get()
  @Render(Page.HOME)
  async getHome() {
    const homepages = await this.usersService.find({
      order: { createdAt: 'DESC' },
      take: 10,
      select: ['username'],
    });
    return { homepages };
  }

  @Get(':username')
  @Render(`${Page.HOME}/${Page.HOMEPAGE}`)
  async getHomeById(@Param('username') username: string) {
    const homepageUser = await this.usersService.findOne({
      where: { username },
    });

    if (!homepageUser) throw new NotFoundException();

    console.log({ homepageUser });

    const createdAt = new Date(homepageUser.createdAt).toLocaleDateString(
      this.textsService.locale,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    );

    const rooms = await this.roomsService.find({
      where: { ownerId: `${homepageUser.id}` },
    });

    const messengerFriends = await this.messengerFriendsService.find({
      where: { fromId: homepageUser.id },
    });
    const friends = await this.usersService.find({
      where: { id: In(messengerFriends.map((friend) => friend.toId)) },
    });

    console.log({ messengerFriends, friends });

    return {
      homepageUser,
      createdAt,
      rooms,
      friends,
    };
  }
}
