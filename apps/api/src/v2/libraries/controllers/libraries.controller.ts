import { Controller, Get } from "@nestjs/common";

@Controller("libraries")
export class LibrariesController {
  @Get()
  getLibraries() {
    // This method would typically call a service to fetch libraries.
    // For now, it returns a static response.
    return [
      { id: "1", name: "Library One", slug: "library-one" },
      { id: "2", name: "Library Two", slug: "library-two" },
    ];
  }
}
