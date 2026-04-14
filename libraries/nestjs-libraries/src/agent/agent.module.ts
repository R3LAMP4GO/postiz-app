import { Global, Module } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { AgentGraphInsertService } from '@gitroom/nestjs-libraries/agent/agent.graph.insert.service';
import { PromptResolverService } from '@gitroom/nestjs-libraries/agent/prompts/prompt-resolver.service';

@Global()
@Module({
  providers: [AgentGraphService, AgentGraphInsertService, PromptResolverService],
  get exports() {
    return this.providers;
  },
})
export class AgentModule {}
